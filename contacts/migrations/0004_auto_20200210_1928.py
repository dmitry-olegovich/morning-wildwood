# Generated by Django 2.2.7 on 2020-02-10 19:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contacts', '0003_auto_20200210_1525'),
    ]

    operations = [
        migrations.AlterField(
            model_name='location',
            name='name',
            field=models.CharField(max_length=20, unique=True),
        ),
    ]