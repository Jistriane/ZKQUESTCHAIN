#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone)]
pub struct PlayerProfile {
    pub address: Address,
    pub username: String,
    pub level: u32,
    pub total_xp: u64,
    pub quests_completed: u32,
    pub success_rate: u32,
    pub achievements: Vec<u64>,
    pub reputation_score: u64,
    pub created_at: u64,
    pub last_active: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Profile(Address),
    QuestManagerContract,
}

#[contract]
pub struct PlayerRegistry;

#[contractimpl]
impl PlayerRegistry {
    pub fn initialize(env: Env, admin: Address, quest_manager: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::QuestManagerContract, &quest_manager);
    }

    pub fn register(env: Env, player: Address, username: String) {
        player.require_auth();
        if env
            .storage()
            .persistent()
            .has(&DataKey::Profile(player.clone()))
        {
            panic!("Player already registered");
        }

        let profile = PlayerProfile {
            address: player.clone(),
            username,
            level: 1,
            total_xp: 0,
            quests_completed: 0,
            success_rate: 0,
            achievements: Vec::new(&env),
            reputation_score: 100,
            created_at: env.ledger().timestamp(),
            last_active: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Profile(player), &profile);
    }

    pub fn add_xp(env: Env, player: Address, xp: u64) {
        let quest_manager: Address = env
            .storage()
            .instance()
            .get(&DataKey::QuestManagerContract)
            .unwrap();
        quest_manager.require_auth();

        let mut profile: PlayerProfile = env
            .storage()
            .persistent()
            .get(&DataKey::Profile(player.clone()))
            .expect("Player not registered");
        profile.total_xp += xp;
        profile.quests_completed += 1;
        profile.last_active = env.ledger().timestamp();

        let new_level = Self::calculate_level(profile.total_xp);
        if new_level > profile.level {
            profile.level = new_level;
        }

        env.storage().persistent().set(&DataKey::Profile(player), &profile);
    }

    fn calculate_level(xp: u64) -> u32 {
        let scaled = xp / 100;
        let level = Self::integer_sqrt(scaled) as u32;
        if level < 1 { 1 } else { level }
    }

    fn integer_sqrt(n: u64) -> u64 {
        if n == 0 { return 0; }
        let mut x0 = n;
        let mut x1 = (x0 + 1) / 2;
        while x1 < x0 {
            x0 = x1;
            x1 = (x1 + n / x1) / 2;
        }
        x0
    }

    pub fn get_profile(env: Env, player: Address) -> PlayerProfile {
        env.storage()
            .persistent()
            .get(&DataKey::Profile(player))
            .expect("Player not found")
    }
}

#[cfg(test)]
mod test {
    extern crate std;

    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{Env, String};

    #[test]
    fn register_and_add_xp() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let quest_manager = Address::generate(&env);
        let player = Address::generate(&env);

        PlayerRegistry::initialize(env.clone(), admin, quest_manager.clone());
        PlayerRegistry::register(env.clone(), player.clone(), String::from_str(&env, "alice"));

        env.mock_all_auths();
        PlayerRegistry::add_xp(env.clone(), player.clone(), 400);
        let profile = PlayerRegistry::get_profile(env, player);
        assert!(profile.total_xp >= 400);
        assert!(profile.level >= 2);
    }
}
