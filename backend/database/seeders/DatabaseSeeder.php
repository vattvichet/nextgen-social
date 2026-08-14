<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $demoUser = User::factory()->create([
            'name' => 'Demo User',
            'username' => 'demo',
            'email' => 'demo@example.com',
        ]);

        $users = User::factory(4)->create();
        $allUsers = $users->push($demoUser);

        Post::factory(15)
            ->recycle($allUsers)
            ->create()
            ->each(function (Post $post) use ($allUsers) {
                Comment::factory(rand(0, 4))
                    ->recycle($allUsers)
                    ->create(['post_id' => $post->id]);
            });
    }
}
