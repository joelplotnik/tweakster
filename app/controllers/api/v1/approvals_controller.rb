class Api::V1::ApprovalsController < ApplicationController
  include Approveable

  before_action :authenticate_user!
  before_action :find_accepted_challenge, only: [:create]

  rescue_from CanCan::AccessDenied do |exception|
    render json: { warning: exception.message }, status: :unauthorized
  end

  def create
    existing_approval = current_user.approvals.find_by(accepted_challenge_id: params[:accepted_challenge_id])

    if existing_approval
      handle_existing_approval(existing_approval)
    else
      create_new_approval
    end
  end
end
