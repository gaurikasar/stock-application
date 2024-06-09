from flask_wtf import FlaskForm
from wtforms.fields import StringField, IntegerField, FloatField
from wtforms.validators import DataRequired, Length


class SellStockForm(FlaskForm):
    stock_symbol = StringField("stock", validators=[DataRequired(), Length(max=5)])
    price_per_share_sold = FloatField("price per share sold", validators=[DataRequired()])
   
