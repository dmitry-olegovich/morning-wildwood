# Generated by Django 2.2.7 on 2020-02-16 09:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('welcome', '0002_slide_active'),
    ]

    operations = [
        migrations.AlterField(
            model_name='slide',
            name='text',
            field=models.CharField(blank=True, default='', max_length=2200),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='slide',
            name='title',
            field=models.CharField(blank=True, default='', max_length=250),
            preserve_default=False,
        ),
    ]