module Approvable
  extend ActiveSupport::Concern

  def handle_existing_approval(approval)
    approval.destroy
    render json: { message: 'Approval removed successfully' }, status: :ok
  end

  def create_new_approval
    approval = current_user.approvals.build(accepted_challenge: @accepted_challenge)

    if approval.save
      render json: { message: 'Approval added successfully' }, status: :created
    else
      render json: { errors: approval.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
