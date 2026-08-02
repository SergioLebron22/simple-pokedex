from django.db.models import Count
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MasterSetCard
from .serializers import MasterSetCardSerializer


class MasterSetSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rows = (
            MasterSetCard.objects
            .filter(user=request.user, owned=True)
            .values('set_id')
            .annotate(owned_count=Count('id'))
        )
        return Response({row['set_id']: row['owned_count'] for row in rows})


class MasterSetDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, set_id):
        ids = (
            MasterSetCard.objects
            .filter(user=request.user, set_id=set_id, owned=True)
            .values_list('tcg_card_id', flat=True)
        )
        return Response({card_id: True for card_id in ids})


class MasterSetCardToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, set_id, card_id):
        card, created = MasterSetCard.objects.get_or_create(
            user=request.user,
            set_id=set_id,
            tcg_card_id=card_id,
            defaults={'owned': False},
        )
        serializer = MasterSetCardSerializer(card, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )
