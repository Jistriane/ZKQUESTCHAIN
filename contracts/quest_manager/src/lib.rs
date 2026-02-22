#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, log, Address, Bytes, BytesN, Env, String, Vec,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum QuestDifficulty {
    Beginner,
    Intermediate,
    Advanced,
    Expert,
    Legendary,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum QuestCategory {
    Math,
    Logic,
    Programming,
    Chess,
    Cryptography,
    DataStructures,
}

#[contracttype]
#[derive(Clone)]
pub struct Quest {
    pub id: u64,
    pub creator: Address,
    pub category: QuestCategory,
    pub difficulty: QuestDifficulty,
    pub title: String,
    pub description_ipfs: String,
    pub vk_hash: BytesN<32>,
    pub reward_xp: u64,
    pub reward_tokens: i128,
    pub completion_count: u32,
    pub success_rate: u32,
    pub is_active: bool,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct QuestAttempt {
    pub quest_id: u64,
    pub player: Address,
    pub proof_hash: BytesN<32>,
    pub timestamp: u64,
    pub success: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    NextQuestId,
    Quest(u64),
    PlayerAttempts(Address),
    QuestsByCategory(QuestCategory),
    VerifierContract,
    PlayerRegistryContract,
    AchievementNftContract,
}

#[contract]
pub struct QuestManager;

#[contractimpl]
impl QuestManager {
    pub fn initialize(
        env: Env,
        admin: Address,
        verifier_contract: Address,
        player_registry: Address,
        achievement_nft: Address,
    ) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NextQuestId, &1u64);
        env.storage()
            .instance()
            .set(&DataKey::VerifierContract, &verifier_contract);
        env.storage()
            .instance()
            .set(&DataKey::PlayerRegistryContract, &player_registry);
        env.storage()
            .instance()
            .set(&DataKey::AchievementNftContract, &achievement_nft);
        log!(&env, "QuestManager initialized");
    }

    pub fn create_quest(
        env: Env,
        creator: Address,
        category: QuestCategory,
        difficulty: QuestDifficulty,
        title: String,
        description_ipfs: String,
        vk_hash: BytesN<32>,
        reward_xp: u64,
        reward_tokens: i128,
    ) -> u64 {
        creator.require_auth();
        let quest_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextQuestId)
            .unwrap_or(1);

        let quest = Quest {
            id: quest_id,
            creator: creator.clone(),
            category: category.clone(),
            difficulty,
            title,
            description_ipfs,
            vk_hash,
            reward_xp,
            reward_tokens,
            completion_count: 0,
            success_rate: 0,
            is_active: true,
            created_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Quest(quest_id), &quest);
        env.storage()
            .instance()
            .set(&DataKey::NextQuestId, &(quest_id + 1));

        let mut category_quests: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::QuestsByCategory(category.clone()))
            .unwrap_or(Vec::new(&env));
        category_quests.push_back(quest_id);
        env.storage()
            .persistent()
            .set(&DataKey::QuestsByCategory(category), &category_quests);

        log!(&env, "Quest created: {}", quest_id);
        quest_id
    }

    pub fn submit_proof(
        env: Env,
        player: Address,
        quest_id: u64,
        proof_blob: Bytes,
        public_inputs: Bytes,
    ) -> bool {
        player.require_auth();
        let quest: Quest = env
            .storage()
            .persistent()
            .get(&DataKey::Quest(quest_id))
            .expect("Quest not found");
        if !quest.is_active {
            panic!("Quest is not active");
        }

        let verifier: Address = env
            .storage()
            .instance()
            .get(&DataKey::VerifierContract)
            .unwrap();
        let is_valid: bool = Self::verify_proof_external(
            &env,
            &verifier,
            &quest.vk_hash,
            &proof_blob,
            &public_inputs,
        );

        let proof_hash = env.crypto().sha256(&proof_blob);
        let proof_hash_bytes: BytesN<32> = proof_hash.into();
        
        let attempt = QuestAttempt {
            quest_id,
            player: player.clone(),
            proof_hash: proof_hash_bytes.clone(),
            timestamp: env.ledger().timestamp(),
            success: is_valid,
        };

        let mut player_attempts: Vec<QuestAttempt> = env
            .storage()
            .persistent()
            .get(&DataKey::PlayerAttempts(player.clone()))
            .unwrap_or(Vec::new(&env));
        player_attempts.push_back(attempt);
        env.storage()
            .persistent()
            .set(&DataKey::PlayerAttempts(player.clone()), &player_attempts);

        if is_valid {
            let mut updated_quest = quest.clone();
            updated_quest.completion_count += 1;
            env.storage()
                .persistent()
                .set(&DataKey::Quest(quest_id), &updated_quest);

            Self::reward_player(
                &env,
                &player,
                quest_id,
                quest.reward_xp,
                quest.reward_tokens,
                proof_hash_bytes,
                quest.description_ipfs.clone(),
            );
            log!(&env, "Quest {} completed by {}", quest_id, player);
        } else {
            log!(&env, "Quest {} failed by {}", quest_id, player);
        }

        is_valid
    }

    fn verify_proof_external(
        env: &Env,
        _verifier_address: &Address,
        vk_hash: &BytesN<32>,
        _proof: &Bytes,
        _public_inputs: &Bytes,
    ) -> bool {
        // TODO: Implementar chamada ao verifier quando cross-contract calls funcionarem
        // Por enquanto, retorna true para permitir testes do MVP
        log!(env, "Verifying proof (stub)");
        log!(env, "VK hash: {}", vk_hash);
        true
    }

    fn reward_player(
        env: &Env,
        player: &Address,
        quest_id: u64,
        xp: u64,
        tokens: i128,
        proof_hash: BytesN<32>,
        metadata_uri: String,
    ) {
        // TODO: Implementar cross-contract calls quando houver solução para invoke_contract
        // Por enquanto, apenas logamos os eventos
        
        log!(env, "Rewarding player");
        log!(env, "Player: {}", player);
        log!(env, "Quest ID: {}", quest_id);
        log!(env, "XP: {}", xp);
        log!(env, "Proof hash: {}", proof_hash);
        log!(env, "Metadata: {}", metadata_uri);

        if tokens > 0 {
            log!(env, "Tokens rewarded: {}", tokens);
        }
    }

    pub fn get_quest(env: Env, quest_id: u64) -> Quest {
        env.storage()
            .persistent()
            .get(&DataKey::Quest(quest_id))
            .expect("Quest not found")
    }

    pub fn get_quests_by_category(env: Env, category: QuestCategory) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::QuestsByCategory(category))
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_player_attempts(env: Env, player: Address) -> Vec<QuestAttempt> {
        env.storage()
            .persistent()
            .get(&DataKey::PlayerAttempts(player))
            .unwrap_or(Vec::new(&env))
    }
}

#[cfg(test)]
mod test {
    extern crate std;

    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{BytesN, Env, String};

    #[test]
    fn create_quest_increments_id() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let verifier = Address::generate(&env);
        let registry = Address::generate(&env);
        let nft = Address::generate(&env);
        let creator = Address::generate(&env);

        QuestManager::initialize(env.clone(), admin, verifier, registry, nft);
        env.mock_all_auths();

        let vk_hash = BytesN::from_array(&env, &[2; 32]);
        let id1 = QuestManager::create_quest(
            env.clone(),
            creator.clone(),
            QuestCategory::Math,
            QuestDifficulty::Beginner,
            String::from_str(&env, "Quest 1"),
            String::from_str(&env, "ipfs://quest"),
            vk_hash.clone(),
            100,
            0,
        );

        let id2 = QuestManager::create_quest(
            env.clone(),
            creator,
            QuestCategory::Math,
            QuestDifficulty::Beginner,
            String::from_str(&env, "Quest 2"),
            String::from_str(&env, "ipfs://quest"),
            vk_hash,
            100,
            0,
        );

        assert_eq!(id1, 1);
        assert_eq!(id2, 2);
    }
}
