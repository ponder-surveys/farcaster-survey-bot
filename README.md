# Surveycaster

A Farcaster bot that posts surveys every Monday and Wednesday.

## Quick Start

#### 1. Clone the repository

```commandline
git clone https://github.com/benadamsky/surveycaster
```

#### 2. Create `.env` with the following environment variables

| Environment Variable | Description                                     | Example Value               |
| -------------------- | ----------------------------------------------- | --------------------------- |
| FARCASTER_MNEMONIC   | Farcaster wallet seed phrase                    | video stairs rabbit tuna... |
| SUPABASE_URL         | Project URL                                     | https://abc123.supabase.co  |
| SUPABASE_KEY         | API key with read & write access to the project | eyJsadfklj34lkjsdflkj324    |
| IMGUR_CLIENT_ID      | Client ID for Imgur API authentication          | 23dc9ac23d9c23d9            |
| IMGUR_CLIENT_SECRET  | Client secret for Imgur API authentication      | a823cd9823cd9823cd          |
| IMGUR_REFRESH_TOKEN  | Refresh token generated via Imgur endpoint      | fd9234234g09udf9023         |
| NEXT_RESULT_CRON     | Task scheduler in cron syntax for next result   | 0 10 * * 3,5                |
| NEXT_QUESTION_CRON   | Task scheduler in cron syntax for next question | 0 11 * * 1,3                |
| NEXT_QUESTION_REPLY  | Customizable reply to question cast (optional)  | Reply:\n\nHey @dwr and @v!  |

#### 3. Install dependencies

```commandline
yarn install
```

#### 4. Run application

```commandline
yarn start
```

## Contributing

Feel free to fork this project and submit pull requests.

Have any suggestions or feedback you'd like to share? Reach out via direct cast on Farcaster.

---

> Made with 💜 by [@colin-](https://warpcast.com/colin-) and [@ba](https://warpcast.com/ba)
