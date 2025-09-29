<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        DB::table('users')->insert([
            'username'    => 'user',
            'household'   => 'Household 1',
            'barangay_id' => 1, 
            'email'       => 'user@example.com',
            'password'    => Hash::make('password123'),
            'photo_path'  => null,
            'is_approved' => true,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        DB::table('complaints')->insert([
            ['user_id' => 1, 'title' => 'Broken Streetlight', 'description' => 'The streetlight on Purok 3 has not been working for weeks, causing safety concerns at night.', 'category' => 'Infrastructure'],
            ['user_id' => 1, 'title' => 'Clogged Drainage', 'description' => 'Heavy rain causes flooding because the drainage near the plaza is blocked.', 'category' => 'Infrastructure'],
            ['user_id' => 1, 'title' => 'Garbage Collection Delay', 'description' => 'Trash has not been collected for more than a week, attracting flies and pests.', 'category' => 'Environment'],
            ['user_id' => 1, 'title' => 'Improper Waste Disposal', 'description' => 'Some residents throw garbage in the creek, causing bad smell and pollution.', 'category' => 'Environment'],
            ['user_id' => 1, 'title' => 'Loud Karaoke at Midnight', 'description' => 'Neighbors use karaoke until past midnight, disturbing sleep every night.', 'category' => 'Peace & Order'],
            ['user_id' => 1, 'title' => 'Illegal Parking', 'description' => 'Tricycles are blocking the road in front of the market, making it hard for vehicles to pass.', 'category' => 'Peace & Order'],
            ['user_id' => 1, 'title' => 'Stray Dogs', 'description' => 'Several stray dogs roam near the school, scaring children and causing safety concerns.', 'category' => 'Health & Safety'],
            ['user_id' => 1, 'title' => 'Barangay Health Center Shortage', 'description' => 'The health center often runs out of medicine and staff are unavailable in the afternoons.', 'category' => 'Health & Safety'],
            ['user_id' => 1, 'title' => 'Water Supply Interruption', 'description' => 'Our area has no water supply for three days, making it difficult for households.', 'category' => 'Utilities'],
            ['user_id' => 1, 'title' => 'Frequent Brownouts', 'description' => 'Electricity often goes out without prior notice, disrupting work and school activities.', 'category' => 'Utilities'],
            ['user_id' => 1, 'title' => 'Slow Internet Connection', 'description' => 'Internet in our barangay is very slow, making online classes and work from home difficult.', 'category' => 'Utilities'],
            ['user_id' => 1, 'title' => 'Slow Response to Complaints', 'description' => 'It takes too long before barangay officials respond to submitted complaints.', 'category' => 'Governance/Services'],
            ['user_id' => 1, 'title' => 'Lack of Transparency in Projects', 'description' => 'Residents are not updated about barangay funds and ongoing infrastructure projects.', 'category' => 'Governance/Services'],
            ['user_id' => 1, 'title' => 'Broken Road Signs', 'description' => 'The stop sign near the barangay hall is damaged and needs replacement.', 'category' => 'Infrastructure'],
            ['user_id' => 1, 'title' => 'Uncollected Yard Waste', 'description' => 'Cut grass and leaves are left uncollected, making the street messy.', 'category' => 'Environment'],
            ['user_id' => 1, 'title' => 'Noise from Construction', 'description' => 'Construction work starts very early in the morning and disturbs nearby residents.', 'category' => 'Peace & Order'],
            ['user_id' => 1, 'title' => 'Flooding in Low Areas', 'description' => 'Water accumulates after rain due to lack of proper drainage system.', 'category' => 'Infrastructure'],
            ['user_id' => 1, 'title' => 'Unsanitary Public Market', 'description' => 'The public market has poor sanitation, with bad odor and flies around food stalls.', 'category' => 'Health & Safety'],
            ['user_id' => 1, 'title' => 'Poor Lighting in Covered Court', 'description' => 'The covered court is poorly lit, making it unsafe for night activities.', 'category' => 'Infrastructure'],
            ['user_id' => 1, 'title' => 'Unresponsive Hotline', 'description' => 'The barangay hotline rarely answers calls, making it hard to report urgent issues.', 'category' => 'Governance/Services'],
        ]);
    }
}
