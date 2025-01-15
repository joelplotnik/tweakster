class Api::V1::ApprovalsController < ApplicationController
  include Approveable
  skip_before_action :verify_authenticity_token, raise: false
  before_action :authenticate_devise_api_token!, only: %i[create]

  def create
    existing_approval = current_user.approvals.find_by(attempt_id: approval_params[:attempt_id])

    if existing_approval
      handle_existing_approval(existing_approval)
    else
      create_new_approval
    end
  end

  private

  def approval_params
    params.require(:approval).permit(:attempt_id)
  end
end
