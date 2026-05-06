from rest_framework import serializers

from .models import CustomBinder, CustomBinderSlot


class CustomBinderSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomBinderSlot
        fields = (
            'slot_index', 'name', 'tcg_image', 'tcg_set',
            'tcg_card_id', 'tcg_local_id', 'notes', 'updated_at',
        )
        read_only_fields = ('slot_index', 'updated_at')


class CustomBinderSerializer(serializers.ModelSerializer):
    slot_count = serializers.SerializerMethodField()

    class Meta:
        model = CustomBinder
        fields = (
            'id', 'name', 'bg_color', 'binder_color',
            'grid_cols', 'grid_rows', 'page_count', 'slot_count',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'slot_count', 'created_at', 'updated_at')

    def get_slot_count(self, obj):
        return obj.slots.count()

    def validate_grid_cols(self, value):
        if not 1 <= value <= 9:
            raise serializers.ValidationError('grid_cols must be between 1 and 9.')
        return value

    def validate_grid_rows(self, value):
        if not 1 <= value <= 9:
            raise serializers.ValidationError('grid_rows must be between 1 and 9.')
        return value


class CustomBinderDetailSerializer(CustomBinderSerializer):
    slots = serializers.SerializerMethodField()

    class Meta(CustomBinderSerializer.Meta):
        fields = CustomBinderSerializer.Meta.fields + ('slots',)

    def get_slots(self, obj):
        data = CustomBinderSlotSerializer(obj.slots.all(), many=True).data
        return {str(s['slot_index']): s for s in data}
