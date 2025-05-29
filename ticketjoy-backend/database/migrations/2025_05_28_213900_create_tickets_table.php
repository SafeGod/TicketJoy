<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('ticket_number')->unique();
            $table->enum('status', ['pending', 'confirmed', 'used', 'cancelled'])->default('pending');
            $table->decimal('price', 10, 2)->default(0);
            $table->timestamp('purchased_at')->nullable();
            $table->text('qr_code')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['event_id', 'status']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};