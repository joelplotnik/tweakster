class Api::V1::ApprovalsController < ApplicationController
  include Approveable

  def create
    existing_approval = current_user.approvals.find_by(accepted_challenge_id: approval_params[:accepted_challenge_id])

    if existing_approval
      handle_existing_approval(existing_approval)
    else
      create_new_approval
    end
  end

  private

  def approval_params
    params.require(:approval).permit(:accepted_challenge_id)
  end
end
