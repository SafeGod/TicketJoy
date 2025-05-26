<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ImageController extends Controller
{
    /**
     * Upload an image and return the URL
     */
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        if ($request->hasFile('image')) {
            // Generate a unique filename
            $filename = 'event_' . time() . '_' . Str::random(10) . '.' . $request->file('image')->getClientOriginalExtension();
            
            // Store the file in the public disk
            $path = $request->file('image')->storeAs('images/events', $filename, 'public');
            
            // Return the URL to the image
            return response()->json([
                'url' => Storage::url($path)
            ]);
        }
        
        return response()->json(['message' => 'No se pudo subir la imagen'], 400);
    }
}