class Api::V1::ReportsController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false
  before_action :authenticate_devise_api_token!, only: %i[index]

  def index
    if current_user.role == 'admin'
      per_page = 10
      reports = Report.all.order(created_at: :asc).paginate(page: params[:page], per_page:)
      total_pages = (reports.total_entries.to_f / per_page).ceil

      reports_with_details = reports.map do |report|
        case report.content_type
        when 'comment'
          comment = Comment.find(report.content_id)
          if comment.commentable.is_a?(Challenge)
            challenge = comment.commentable
            reporter = User.find(report.reporter_id)
            creator = challenge.user
            {
              report:,
              comment:,
              challenge:,
              reporter:,
              creator:
            }
          elsif comment.commentable.is_a?(Attempt)
            attempt = comment.commentable
            challenge = attempt.challenge
            reporter = User.find(report.reporter_id)
            creator = attempt.user
            {
              report:,
              comment:,
              attempt:,
              challenge:,
              reporter:,
              creator:
            }
          else
            { error: 'Invalid comment association' }
          end
        when 'user'
          reporter = User.find(report.reporter_id)
          reported_user = User.find(report.content_id)
          {
            report:,
            reporter:,
            creator: reported_user
          }
        when 'challenge'
          challenge = Challenge.find(report.content_id)
          reporter = User.find(report.reporter_id)
          creator = challenge.user
          {
            report:,
            challenge:,
            reporter:,
            creator:
          }
        when 'attempt'
          attempt = Attempt.find(report.content_id)
          challenge = attempt.challenge
          reporter = User.find(report.reporter_id)
          creator = attempt.user
          {
            report:,
            attempt:,
            challenge:,
            reporter:,
            creator:
          }
        else
          { error: 'Invalid content type' }
        end
      end

      render json: { reports: reports_with_details, total_pages: }
    else
      render json: { error: 'You are not authorized to access this page.' }, status: :forbidden
    end
  end

  def create
    report = current_user.reports.build(report_params)

    if report.valid?
      if report.save
        render json: report, status: :created
      else
        render json: { error: 'Failed to create report' }, status: :unprocessable_entity
      end
    elsif report.errors.full_messages.include?('Content has already been reported by this user')
      render json: { error: 'Content has already been reported by this user' }, status: :unprocessable_entity
    else
      render json: report.errors, status: :unprocessable_entity
    end
  end

  def destroy
    report = Report.find(params[:id])

    if current_user.admin?
      reporter = User.find(report.reporter_id)

      if report.destroy
        reporter.reports.delete(report)

        render json: { message: 'Report deleted successfully' }, status: :ok
      else
        render json: { error: 'Failed to delete report' }, status: :unprocessable_entity
      end
    else
      render json: { error: 'You are not authorized to delete reports' }, status: :forbidden
    end
  end

  private

  def report_params
    params.permit(:content_type, :content_id, :reason)
  end
end
