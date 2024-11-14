module Approvable
  extend ActiveSupport::Concern

  def handle_existing_approval(approval)
    approval.destroy
    render json: { message: 'Approval removed successfully' }, status: :ok
  end

  def create_new_approval
    approval = current_user.approvals.build(attempt: @attempt)

    if approval.save
      render json: { success: true, message: 'Approval added successfully' }, status: :created
    else
      render json: { success: false, errors: approval.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
