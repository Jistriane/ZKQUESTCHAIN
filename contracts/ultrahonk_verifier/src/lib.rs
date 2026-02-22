#![no_std]

use soroban_sdk::{contract, contractimpl, Bytes, BytesN, Env};

#[contract]
pub struct UltraHonkVerifier;

#[contractimpl]
impl UltraHonkVerifier {
    pub fn verify(_env: Env, _vk_hash: BytesN<32>, proof: Bytes, _public_inputs: Bytes) -> bool {
        proof.len() > 0
    }
}
