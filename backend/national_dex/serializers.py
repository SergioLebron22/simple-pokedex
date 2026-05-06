from rest_framework import serializers

from .models import NationalDexCard


class NationalDexCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = NationalDexCard
        fields = (
            'slot_index', 'name', 'tcg_image', 'tcg_set',
            'tcg_card_id', 'tcg_local_id', 'notes', 'updated_at',
        )
        read_only_fields = ('slot_index', 'updated_at')
