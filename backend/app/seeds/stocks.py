from app.models import db, Stock, environment, SCHEMA
import os

def seed_stocks():

    with open(f'{os.path.dirname(__file__)}/stocks_list.csv', 'r') as csv_file:
        for row in csv_file.readlines()[1:]:
            stock_symbol, company_name = row.split(',')[:2]
            db.session.add(Stock(stock_symbol=stock_symbol, company_name=company_name))

    db.session.commit()

# Uses a raw SQL query to TRUNCATE or DELETE the users table. SQLAlchemy doesn't
# have a built in function to do this. With postgres in production TRUNCATE
# removes all the data from the table, and RESET IDENTITY resets the auto
# incrementing primary key, CASCADE deletes any dependent entities.  With
# sqlite3 in development you need to instead use DELETE to remove all data and
# it will reset the primary keys for you as well.
def undo_stocks():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.stocks RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("DELETE FROM stocks")

    db.session.commit()
