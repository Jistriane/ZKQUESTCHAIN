#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, String, Vec};

#[contracttype]
#[derive(Clone)]
pub struct Achievement {
    pub token_id: u64,
    pub owner: Address,
    pub quest_id: u64,
    pub proof_hash: BytesN<32>,
    pub metadata_uri: String,
    pub minted_at: u64,
    pub is_soulbound: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    NextTokenId,
    Achievement(u64),
    OwnerTokens(Address),
    QuestManagerContract,
}

#[contract]
pub struct AchievementNFT;

#[contractimpl]
impl AchievementNFT {
    pub fn initialize(env: Env, admin: Address, quest_manager: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NextTokenId, &1u64);
        env.storage()
            .instance()
            .set(&DataKey::QuestManagerContract, &quest_manager);
    }

    pub fn mint(
        env: Env,
        to: Address,
        quest_id: u64,
        proof_hash: BytesN<32>,
        metadata_uri: String,
    ) -> u64 {
        let quest_manager: Address = env
            .storage()
            .instance()
            .get(&DataKey::QuestManagerContract)
            .unwrap();
        quest_manager.require_auth();

        let token_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextTokenId)
            .unwrap_or(1);

        let achievement = Achievement {
            token_id,
            owner: to.clone(),
            quest_id,
            proof_hash,
            metadata_uri,
            minted_at: env.ledger().timestamp(),
            is_soulbound: true,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Achievement(token_id), &achievement);

        let mut owner_tokens: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::OwnerTokens(to.clone()))
            .unwrap_or(Vec::new(&env));
        owner_tokens.push_back(token_id);
        env.storage()
            .persistent()
            .set(&DataKey::OwnerTokens(to), &owner_tokens);

        env.storage().instance().set(&DataKey::NextTokenId, &(token_id + 1));
        token_id
    }

    pub fn get_achievement(env: Env, token_id: u64) -> Achievement {
        env.storage()
            .persistent()
            .get(&DataKey::Achievement(token_id))
            .expect("Achievement not found")
    }

    pub fn get_owner_achievements(env: Env, owner: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::OwnerTokens(owner))
            .unwrap_or(Vec::new(&env))
    }

    pub fn transfer(_env: Env, _from: Address, _to: Address, _token_id: u64) {
        panic!("Achievement NFTs are soulbound and cannot be transferred");
    }
}

    #[cfg(test)]
    mod test {
        extern crate std;

        use super::*;
        use soroban_sdk::testutils::Address as _;
        use soroban_sdk::{Env, String, BytesN};

        #[test]
        fn mint_and_fetch() {
            let env = Env::default();
            let admin = Address::generate(&env);
            let quest_manager = Address::generate(&env);
            let owner = Address::generate(&env);
            let proof_hash = BytesN::from_array(&env, &[1; 32]);

            AchievementNFT::initialize(env.clone(), admin, quest_manager.clone());

            env.mock_all_auths();
            let token_id = AchievementNFT::mint(
                env.clone(),
                owner.clone(),
                1,
                proof_hash,
                String::from_str(&env, "ipfs://test"),
            );

            let achievement = AchievementNFT::get_achievement(env.clone(), token_id);
            assert_eq!(achievement.owner, owner);
            let tokens = AchievementNFT::get_owner_achievements(env, owner);
            assert_eq!(tokens.len(), 1);
        }
    }
