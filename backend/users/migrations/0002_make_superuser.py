import os
from django.db import migrations


def promote_superuser(apps, schema_editor):
    email = os.environ.get('SUPERUSER_EMAIL')
    if not email:
        return
    User = apps.get_model('users', 'User')
    User.objects.filter(email=email).update(is_staff=True, is_superuser=True)


class Migration(migrations.Migration):
    dependencies = [('users', '0001_initial')]
    operations = [migrations.RunPython(promote_superuser, migrations.RunPython.noop)]
