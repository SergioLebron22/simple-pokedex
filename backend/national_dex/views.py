from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import NationalDexBinder, NationalDexCard
from .serializers import NationalDexCardSerializer


def _get_or_create_binder(user):
    binder, _ = NationalDexBinder.objects.get_or_create(user=user)
    return binder


class NationalDexView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        binder = _get_or_create_binder(request.user)
        cards = NationalDexCardSerializer(binder.cards.all(), many=True).data
        # Keyed by pokemon_name for O(1) frontend lookup
        return Response({c['pokemon_name']: c for c in cards})


class NationalDexSlotView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pokemon_name):
        binder = _get_or_create_binder(request.user)
        card, created = NationalDexCard.objects.get_or_create(
            binder=binder,
            pokemon_name=pokemon_name,
            defaults={'name': ''},
        )
        serializer = NationalDexCardSerializer(card, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request, pokemon_name):
        binder = _get_or_create_binder(request.user)
        deleted, _ = NationalDexCard.objects.filter(
            binder=binder, pokemon_name=pokemon_name
        ).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
