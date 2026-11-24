# Security policy

## Supported use

This repository is a portfolio/learning application. Keep dependencies updated and use Razorpay Test Mode during development.

## Reporting a vulnerability

Do not publish credentials, API keys, payment data, or exploit details in a public issue. Contact the repository owner privately with a concise description and reproduction steps.

## Secret handling

- Never commit `.env` files, database credentials, JWT secrets, Razorpay key secrets, or webhook secrets.
- Rotate any credential that has been committed or shared accidentally.
- Keep only placeholders in `.env.example` files.
