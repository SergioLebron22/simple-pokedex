from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('binders', '0003_custombinder_page_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='custombinderslot',
            name='owned',
            field=models.BooleanField(default=True),
        ),
    ]
