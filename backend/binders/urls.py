from django.urls import path

from .views import CustomBinderDetailView, CustomBinderListView, CustomBinderSlotView

urlpatterns = [
    path('',                                     CustomBinderListView.as_view()),
    path('<int:pk>/',                            CustomBinderDetailView.as_view()),
    path('<int:pk>/slots/<int:slot_index>/',     CustomBinderSlotView.as_view()),
]
