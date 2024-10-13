# Running the shovel indexer

1. Install dependencies: `npm install`
2. Create a `.env` file based on `.env_sample` and fill in the required values.
3. Run the script: `npm run build`
3. Generate config.json: `npm run generate`
5. Download Shovel and run based on table

```
brew install postgresql@16
brew services start postgresql@16
createdb shovel
curl -LO --silent https://indexsupply.net/bin/1.6/darwin/arm64/shovel
chmod +x shovel
./shovel -config config.json
```

# ToDo
- [ ] Adapt dummy.ts to fit our contracts (Note ToDo in file)
- [ ] Include environment variables to replace all the hardcoded values