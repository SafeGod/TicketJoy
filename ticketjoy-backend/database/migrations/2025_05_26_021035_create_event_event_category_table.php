<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_event_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->foreignId('event_category_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['event_id', 'event_category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_event_category');
    }
};