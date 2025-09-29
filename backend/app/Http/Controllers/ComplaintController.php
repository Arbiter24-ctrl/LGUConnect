<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    public function analyze()
    {
        // 1. Fetch complaints from DB
        $complaints = Complaint::all(['title', 'description', 'category']);

        if ($complaints->isEmpty()) {
            return response()->json(['message' => 'No complaints available.']);
        }

        // 2. Prepare training data
        $samples = [];
        $labels  = [];

        foreach ($complaints as $c) {
            $samples[] = $c->title . ' ' . $c->description; // combine text
            $labels[]  = $c->category; // target label
        }

        // 3. Vectorize text (Bag of Words)
        $vectorizer = new TokenCountVectorizer(new WhitespaceTokenizer());
        $vectorizer->fit($samples);
        $vectorizer->transform($samples);

        // 4. Train Logistic Regression
        $classifier = new LogisticRegression();
        $classifier->train($samples, $labels);

        // 5. Predict categories & count stats
        $stats = [];
        foreach ($complaints as $c) {
            $sample = [$c->title . ' ' . $c->description];
            $vectorizer->transform($sample);
            $prediction = $classifier->predict($sample);

            if (!isset($stats[$prediction])) {
                $stats[$prediction] = 0;
            }
            $stats[$prediction]++;
        }

        // 6. Prioritization = sort categories by frequency
        arsort($stats);

        // 7. Prepare response
        return response()->json([
            'category_statistics' => $stats,
            'priority_order' => array_keys($stats),
        ]);
    }
}
