from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('national_dex', '0002_initial'),
    ]

    operations = [
        # Clear existing rows — data is keyed by positional slot_index which is
        # no longer meaningful after the Pokémon list order changed.
        migrations.RunSQL(
            sql='DELETE FROM national_dex_nationaldexcard;',
            reverse_sql=migrations.RunSQL.noop,
        ),
        # Drop the old positional unique constraint before removing the field.
        migrations.AlterUniqueTogether(
            name='nationaldexcard',
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name='nationaldexcard',
            name='slot_index',
        ),
        migrations.AddField(
            model_name='nationaldexcard',
            name='pokemon_name',
            field=models.CharField(default='', max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='nationaldexcard',
            name='owned',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterUniqueTogether(
            name='nationaldexcard',
            unique_together={('binder', 'pokemon_name')},
        ),
    ]
