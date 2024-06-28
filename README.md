# Robinhood clone - A Stock buying and selling platform
# Features 
1. Login & Signup
2. Stock Dashboard 
3. Stock buy and sell
4. Logout
   
## Steps to Run the Application frontend and backend

### Start Client Side
1. Navigate to the client folder:
    ```sh
    cd frontend/react-app
    ```
2. Install dependencies:
    ```sh
    npm install
    ```
3. Start the development server:
    ```sh
    npm start
    ```

### Start Backend
1. Navigate to the server folder:
    ```sh
    cd backend
    ```
2. Install Pipenv:
    ```sh
    python -m pip install pipenv
    ```
3. Install all libraries from pipenv:
    ```sh
    pipenv install
    ```

4. Create env file and add the following:
```sh
    SECRET_KEY=lkasjdf09ajsdkfljalsiorj12n3490re9485309irefvn,u90818734902139489230
DATABASE_URL=sqlite:///dev.db
SCHEMA=flask_schema
    ```

5. Run this command
```sh
    flask db upgrade
    ```

6.Run the app:
```sh
    flask run
    ```

# API's used
1. yfinance : to show data related to companies
2. finnhub : to generate data for news which fetches realtime news related to stocks.
