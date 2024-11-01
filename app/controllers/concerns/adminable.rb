module Adminable
  extend ActiveSupport::Concern

  included do
    before_action :require_admin!, only: admin_actions
  end

  class_methods do
    def admin_actions(*actions)
      @admin_actions = actions
    end

    def admin_action_list
      @admin_actions || []
    end
  end

  private

  def require_admin!
    return if current_user&.admin?

    render json: { error: 'You are not authorized to access this page' }, status: :unauthorized
  end
end
