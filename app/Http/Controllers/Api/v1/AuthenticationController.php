<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Jobs\SendOTPVerificationJob;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuthenticationController extends Controller
{
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone_number' => 'required|string|max:15|unique:users',
        ]);

        $otp = rand(100000, 999999);
        $phoneNumber = $request->phone_number;

        User::updateOrCreate(
            ['phone_number' => $phoneNumber],
            ['otp' => Hash::make($otp)]
        );

        SendOTPVerificationJob::dispatch($phoneNumber, $otp);

        return $this->success(message: 'OTP sent successfully.');
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'phone_number' => 'required|string|max:15',
            'otp' => 'required|string|min:6|max:6',
        ]);

        $user = User::where('phone_number', $request->phone_number)->first();

        if (!$user || !Hash::check($request->otp, $user->otp)) {
            return $this->error('Invalid OTP or phone number.', [], 400);
        }

        $user->otp = null;
        $user->save();

        return $this->createTokenResponse(user: $user, message: 'User logged in successfully.');
    }

    public function refresh(): JsonResponse
    {
        try {
            $newToken = JWTAuth::parseToken()->refresh();
            $user = Auth::user();
            $refreshToken = JWTAuth::claims(['type' => 'refresh'])->fromUser($user);

            return $this->responseWithToken(
                token: $newToken,
                refresh_token: $refreshToken,
                user: $user
            );
        } catch (JWTException $e) {
            return $this->error(error: 'Could not refresh token', code: 500);
        }
    }

    public function logout(): JsonResponse
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return $this->success([], 'User logged out successfully.');
        } catch (JWTException $e) {
            return $this->error(error: 'Could not logout user', code: 500);
        }
    }

    public function getUser(): JsonResponse
    {
        return $this->success(result: Auth::user()->toArray(), message: 'User retrieved successfully.');
    }

    private function createTokenResponse(mixed $user, string $message): JsonResponse
    {
        $token = JWTAuth::fromUser($user);
        $refreshToken = JWTAuth::claims(['type' => 'refresh'])->fromUser($user);

        return $this->responseWithToken(
            token: $token,
            refresh_token: $refreshToken,
            user: $user
        );
    }

    private function responseWithToken(
        string                    $token,
        string                    $refresh_token,
        User|Authenticatable|null $user
    ): JsonResponse
    {
        return $this->success(
            result: [
                'user' => $user,
                'token_type' => 'Bearer',
                'expires_in' => JWTAuth::factory()->getTTL() * 60,
                'access_token' => $token,
                'refresh_token' => $refresh_token,
            ],
            message: 'Token generated successfully.'
        );
    }
}
