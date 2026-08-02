from rest_framework import serializers

from .models import MasterSetCard


class MasterSetCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterSetCard
        fields = ('set_id', 'tcg_card_id', 'owned', 'updated_at')
        read_only_fields = ('set_id', 'tcg_card_id', 'updated_at')
