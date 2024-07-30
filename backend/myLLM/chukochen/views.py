from django.http import HttpResponse, JsonResponse
from .utils import get_voice_answer_by_llm, get_text_answer_by_llm, get_video_answer_by_llm


def index(request):
    return HttpResponse("Hello, world. You're at the chukochen index.")


def answer(request):
    if request.method == 'GET':
        temp = request.GET.get('str')
        if temp is not None:
            return JsonResponse({"answer": get_voice_answer_by_llm(temp)}, status=200)
        else:
            answer_type = request.GET.get('type')
            if answer_type == 'text':
                return JsonResponse({"answer": get_text_answer_by_llm(temp)}, status=200)
            elif answer_type == 'voice':
                return JsonResponse({"answer": get_voice_answer_by_llm(temp)}, status=200)
            elif answer_type == 'video':
                return JsonResponse({"answer": get_video_answer_by_llm(temp)}, status=200)
            else:
                return JsonResponse({"error":"Wrong Answer Type, Please Check Your Answer Type"}, status=200)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)