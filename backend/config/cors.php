<?php

return [
    'paths' => ['api/*'],

    'allowed_origins' => [env('FRONTEND_URL', '*') . ''],
];
