<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ComplaintController;


Route::prefix('barangay')->group(function () {
    // Barangays list endpoint
    Route::get('/barangays', function(Request $request) {
        $query = Barangay::query();

        if ($request->name) {
            $query->where('name', $request->name);
        }

        return response()->json($query->get(['id', 'name']));
    });


    // Public routes
    Route::post('/analyze', [ComplaintController::class, 'analyze']);
});