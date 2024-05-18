<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\v1\AuthenticationController;

Route::prefix('v1')->group(function () {
    Route::post('send-otp', [AuthenticationController::class, 'sendOtp']);
    Route::post('login', [AuthenticationController::class, 'login']);
    Route::post('refresh', [AuthenticationController::class, 'refresh']);
    Route::post('logout', [AuthenticationController::class, 'logout']);
});
