from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CustomBinder, CustomBinderSlot
from .serializers import (
    CustomBinderDetailSerializer,
    CustomBinderSerializer,
    CustomBinderSlotSerializer,
)


class CustomBinderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        binders = CustomBinder.objects.filter(user=request.user)
        return Response(CustomBinderSerializer(binders, many=True).data)

    def post(self, request):
        serializer = CustomBinderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CustomBinderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get(self, request, pk):
        try:
            return CustomBinder.objects.get(pk=pk, user=request.user)
        except CustomBinder.DoesNotExist:
            return None

    def get(self, request, pk):
        binder = self._get(request, pk)
        if not binder:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(CustomBinderDetailSerializer(binder).data)

    def patch(self, request, pk):
        binder = self._get(request, pk)
        if not binder:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = CustomBinderSerializer(binder, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        binder = self._get(request, pk)
        if not binder:
            return Response(status=status.HTTP_404_NOT_FOUND)
        binder.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CustomBinderSlotView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_binder(self, request, pk):
        try:
            return CustomBinder.objects.get(pk=pk, user=request.user)
        except CustomBinder.DoesNotExist:
            return None

    def put(self, request, pk, slot_index):
        binder = self._get_binder(request, pk)
        if not binder:
            return Response(status=status.HTTP_404_NOT_FOUND)

        max_slots = binder.grid_rows * binder.grid_cols
        if not 0 <= slot_index < max_slots:
            return Response(
                {'detail': f'slot_index must be 0–{max_slots - 1} for this binder.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        slot, created = CustomBinderSlot.objects.get_or_create(
            binder=binder,
            slot_index=slot_index,
            defaults={'name': ''},
        )
        serializer = CustomBinderSlotSerializer(slot, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request, pk, slot_index):
        binder = self._get_binder(request, pk)
        if not binder:
            return Response(status=status.HTTP_404_NOT_FOUND)
        deleted, _ = CustomBinderSlot.objects.filter(
            binder=binder, slot_index=slot_index
        ).delete()
        if not deleted:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
