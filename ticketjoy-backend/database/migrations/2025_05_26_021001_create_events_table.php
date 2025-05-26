<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->string('location');
            $table->string('address')->nullable();
            $table->integer('capacity');
            $table->decimal('price', 10, 2)->default(0);
            $table->string('image')->nullable();
            $table->enum('status', ['draft', 'published', 'cancelled', 'completed'])->default('draft');
            $table->foreignId('organizer_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};