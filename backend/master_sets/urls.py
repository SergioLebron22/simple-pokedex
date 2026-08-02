from django.urls import path

from .views import MasterSetCardToggleView, MasterSetDetailView, MasterSetSummaryView

urlpatterns = [
    path('',                                  MasterSetSummaryView.as_view()),
    path('<str:set_id>/',                     MasterSetDetailView.as_view()),
    path('<str:set_id>/cards/<str:card_id>/', MasterSetCardToggleView.as_view()),
]
