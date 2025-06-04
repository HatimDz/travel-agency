<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any users.
     */
    public function viewAny(User $user)
    {
        // DEBUG: Temporarily allow all authenticated users to view users for debugging
        \Log::info('UserPolicy@viewAny (DEBUG: allow all roles)', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'roles' => $user->getRoleNames()
        ]);
        // TODO: Revert to SuperAdmin only after debugging
        return true;
    }

    /**
     * DEBUG: Allow all authenticated users to create users for debugging
     */
    public function create(User $user)
    {
        \Log::info('UserPolicy@create (DEBUG: allow all roles)', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'roles' => $user->getRoleNames()
        ]);
        // TODO: Revert to SuperAdmin/Seller only after debugging
        return true;
    }

    /**
     * Allow all authenticated users to view any user (for debugging)
     */
    public function view(User $user, User $model)
    {
        \Log::info('UserPolicy@view (DEBUG: allow all roles)', [
            'auth_user_id' => $user->id,
            'auth_user_email' => $user->email,
            'target_user_id' => $model->id,
            'target_user_email' => $model->email,
            'roles' => $user->getRoleNames()
        ]);
        // TODO: Restrict to SuperAdmin/self after debugging
        return true;
    }

    // Add other methods as needed (view, update, delete, etc.)
}
