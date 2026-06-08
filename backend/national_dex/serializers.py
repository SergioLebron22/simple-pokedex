from rest_framework import serializers

from .models import NationalDexCard


class NationalDexCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = NationalDexCard
        fields = (
            'pokemon_name', 'name', 'tcg_image', 'tcg_set',
            'tcg_card_id', 'tcg_local_id', 'notes', 'owned', 'updated_at',
        )
        read_only_fields = ('pokemon_name', 'updated_at')
