<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendOTPVerificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $phone_number;
    protected $otp;

    protected $app_name = 'Kocek';

    protected $app_url = 'https://kocek.devlab.id';

    /**
     * Create a new job instance.
     */
    public function __construct($phone_number, $otp)
    {
        $this->phone_number = $phone_number;
        $this->otp = $otp;

        $this->app_name = config('app.name');
        $this->app_url = config('app.url');
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        $token = config('services.otp.token');
        $message = "{$this->app_name} - JANGAN MEMBERITAHU KODE INI KE SIAPAPUN termasuk pihak Kocek. WASPADA TERHADAP KASUS PENIPUAN! KODE RAHASIA: {$this->otp}. @{$this->app_url}#{$this->otp}";

        $response = Http::get("https://websms.co.id/api/smsgateway", [
            'token' => $token,
            'to' => $this->phone_number,
            'msg' => $message,
        ]);

        if ($response->status() !== 200) {
            Log::alert('Failed to send OTP verification message.');
        }
    }
}
