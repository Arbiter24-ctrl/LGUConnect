<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Phpml\Classification\KNearestNeighbors;
use Phpml\FeatureExtraction\TokenCountVectorizer;
use Phpml\Tokenization\WordTokenizer;

class ComplaintController extends Controller
{
    public function analyze()
    {
        // Get complaints from DB
        $complaints = DB::table('complaints')->get();

        // Prepare samples (descriptions) and labels (categories)
        $samples = [];
        $labels = [];

        foreach ($complaints as $complaint) {
            $samples[] = $complaint->description;
            $labels[] = $complaint->category;
        }

        // Vectorize text data
        $vectorizer = new TokenCountVectorizer(new WordTokenizer());
        $vectorizer->fit($samples);
        $vectorizer->transform($samples);

        // Train classifier (KNN, k=3 for small dataset)
        $classifier = new KNearestNeighbors(3);
        $classifier->train($samples, $labels);

        // Predict priorities for each complaint
        $results = [];
        foreach ($complaints as $complaint) {
            $sample = [$complaint->description];
            $vectorizer->transform($sample);

            $predictedCategory = $classifier->predict($sample);

            $results[] = [
                'id' => $complaint->id,
                'title' => $complaint->title,
                'description' => $complaint->description,
                'actual_category' => $complaint->category,
                'predicted_category' => $predictedCategory,
            ];
        }

        return response()->json($results);
    }
}
