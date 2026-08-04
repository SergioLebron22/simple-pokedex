from rest_framework import serializers

from .models import MasterSetCard, MasterSetCardVariant, MasterSetTotalSlots


class MasterSetCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterSetCard
        fields = ('set_id', 'tcg_card_id', 'owned', 'updated_at')
        read_only_fields = ('set_id', 'tcg_card_id', 'updated_at')


class MasterSetCardVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterSetCardVariant
        fields = ('set_id', 'tcg_card_id', 'variant', 'owned', 'updated_at')
        read_only_fields = ('set_id', 'tcg_card_id', 'variant', 'updated_at')


class MasterSetTotalSlotsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterSetTotalSlots
        fields = ('set_id', 'total_slots', 'updated_at')
        read_only_fields = ('set_id', 'updated_at')
