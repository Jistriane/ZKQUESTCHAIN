# Deploy (MVP)

## Checklist

- Generate ACIR artifact for the Sudoku circuit and copy to frontend/public/circuits/sudoku/circuit.acir.
- Deploy Soroban contracts on Futurenet.
- Update IDs in frontend/.env (copy from .env.example).
- Configure Vercel and publish the frontend.

## Notes

- The frontend only runs end-to-end after ACIR and real IDs are set.
- Keep the network override selector in the header as a Testnet fallback.
