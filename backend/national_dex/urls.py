from django.urls import path

from .views import NationalDexSlotView, NationalDexView

urlpatterns = [
    path('',                                  NationalDexView.as_view()),
    path('pokemon/<str:pokemon_name>/',       NationalDexSlotView.as_view()),
]
