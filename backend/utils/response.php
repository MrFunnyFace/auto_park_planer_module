<?php

class Response
{
    public static function success($data = [], $code = 200)
    {
        http_response_code($code);
        echo json_encode([
            'success' => true,
            'data' => $data
        ]);
        exit;
    }

    public static function error($message = 'Ошибка', $code = 400)
    {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'message' => $message
        ]);
        exit;
    }

    public static function unauthorized($message = 'Неавторизован')
    {
        self::error($message, 401);
    }

    public static function notFound($message = 'Не найдено')
    {
        self::error($message, 404);
    }

    public static function methodNotAllowed($message = 'Метод не разрешён')
    {
        self::error($message, 405);
    }
}
