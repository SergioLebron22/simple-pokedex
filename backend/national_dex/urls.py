from django.urls import path

from .views import NationalDexSlotView, NationalDexView

urlpatterns = [
    path('',                         NationalDexView.as_view()),
    path('slots/<int:slot_index>/',  NationalDexSlotView.as_view()),
]
