from django.urls import path

from .views import (
    MasterSetCardToggleView,
    MasterSetCardVariantToggleView,
    MasterSetDetailView,
    MasterSetSummaryView,
    MasterSetTotalSlotsView,
    MasterSetVariantsView,
)

urlpatterns = [
    path('',                                                    MasterSetSummaryView.as_view()),
    path('<str:set_id>/',                                       MasterSetDetailView.as_view()),
    path('<str:set_id>/variants/',                              MasterSetVariantsView.as_view()),
    path('<str:set_id>/total-slots/',                           MasterSetTotalSlotsView.as_view()),
    path('<str:set_id>/cards/<str:card_id>/',                   MasterSetCardToggleView.as_view()),
    path('<str:set_id>/cards/<str:card_id>/variants/<str:variant>/', MasterSetCardVariantToggleView.as_view()),
]
