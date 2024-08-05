from django.http import HttpResponse, JsonResponse
from .utils import get_voice_answer_by_llm, get_text_answer_by_llm, get_video_answer_by_llm


def index(request):
    return HttpResponse("Hello, world. You're at the chukochen index.")


def answer(request):
    if request.method == 'GET':
        answer_type = request.GET.get('type')
        if request.GET.get("str") == "":
            return JsonResponse({"error": "No Contents in your question"}, status=200)
        temp = request.GET.get('str')
        if answer_type == 'text':
            try:
                result = get_text_answer_by_llm(temp)
                return JsonResponse({"answer": result}, status=200)
            except Exception as e:
                print(e)
                return JsonResponse({"error": "Failed to generate text answer!"}, status=200)
        elif answer_type == 'voice':
            try:
                result = get_voice_answer_by_llm(temp)
                return JsonResponse({"answer": result}, status=200)
            except Exception as e:
                print(e)
                return JsonResponse({"error": "Failed to generate answer!"}, status=200)
        elif answer_type == 'video':
            try:
                result = get_video_answer_by_llm(temp)
                return JsonResponse({"answer": result}, status=200)
            except Exception as e:
                print(e)
                return JsonResponse({"error": "Failed to generate answer!"}, status=200)
        else:
            return JsonResponse({"error":"Wrong Answer Type, Please Check Your Answer Type"}, status=200)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)