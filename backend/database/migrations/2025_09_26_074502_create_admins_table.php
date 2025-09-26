<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->enum('role', ['super_admin', 'coa'])->default('super_admin');
            $table->string('password');
            $table->string('photo_path')->nullable();
            $table->timestamps();
        });

        
        // Insert super admin account
        DB::table('admins')->insert([
            'username' => 'admin@gmail.com',
            'email' => 'admin',
            'password' => Hash::make('admin123'),
            'name' => 'Super Administrator',
            'role' => 'super_admin',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
