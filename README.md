# 💬 Chat-Commerce 🛒 (Jupyter Notebook)

A ChatBot powered by OpenAI GPT-3.5 which can answer questions based on e-commerce data.

## Instructions

1. Duplicate [`.env.example`](./.env.example) to `.env` file and paste in your [OpenAI Key](https://platform.openai.com/account/api-keys)

2. Install dependencies

   ```sh
   npm install
   ```

3. Start the [Langchain Tracer](https://langchain.readthedocs.io/en/latest/tracing.html) (Open http://localhost:4173/)

   ```sh
   docker-compose up
   # OR
   podman-compose up
   ```

4. Run the program
   ```sh
   npm run build && npm start
   ```

## Credits

1. Sample Data - [Home & Garden Products](https://github.com/shopifypartners/product-csvs/blob/master/home-and-garden.csv)

## License

[MIT License](./LICENSE)
