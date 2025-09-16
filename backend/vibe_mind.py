#!/usr/bin/env python3
"""
Vibe Mind - Multimodal Prompt Enrichment Tool

This script provides a comprehensive multimodal prompt enrichment system
that translates visual and textual input into high-quality, AI-ready prompts
for vibe coding platforms like V0, Magic Pattern, Lovable, and more.
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, Optional, List
from chat_agent_with_image_analysis import ImageAnalysisChatAgent


class UserProfile:
    """Represents a user profile with predefined analysis options."""
    
    def __init__(self, name: str, description: str, analysis_steps: List[str], 
                 report_template: str, template_mapping: Dict[str, str] = None, 
                 summary_text: str = ""):
        """
        Initialize a user profile.
        
        Args:
            name: Profile name
            description: Profile description
            analysis_steps: List of predefined analysis questions/steps
            report_template: Template for markdown output
            template_mapping: Mapping of analysis results to template variables
            summary_text: Summary text for the profile
        """
        self.name = name
        self.description = description
        self.analysis_steps = analysis_steps
        self.report_template = report_template
        self.template_mapping = template_mapping or {}
        self.summary_text = summary_text
    
    @classmethod
    def from_json_file(cls, filepath: str) -> 'UserProfile':
        """Load a user profile from a JSON file."""
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return cls(
            name=data['name'],
            description=data['description'],
            analysis_steps=data['analysis_steps'],
            report_template=data['report_template'],
            template_mapping=data.get('template_mapping', {}),
            summary_text=data.get('summary_text', '')
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert profile to dictionary for JSON serialization."""
        return {
            'name': self.name,
            'description': self.description,
            'analysis_steps': self.analysis_steps,
            'report_template': self.report_template,
            'template_mapping': self.template_mapping,
            'summary_text': self.summary_text
        }
    
    def save_to_file(self, filepath: str) -> None:
        """Save profile to a JSON file."""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.to_dict(), f, indent=2, ensure_ascii=False)


class StructuredImageAnalyzer:
    """A class for performing structured image analysis."""
    
    def __init__(self, profiles_dir: str = "profiles", reports_dir: str = "reports"):
        """Initialize the analyzer with an ImageAnalysisChatAgent."""
        self.agent = ImageAnalysisChatAgent()
        self.profiles_dir = profiles_dir
        self.reports_dir = reports_dir
        self.user_profiles = self._load_profiles_from_folder()
        self._ensure_reports_directory()
    
    def _load_profiles_from_folder(self) -> Dict[str, UserProfile]:
        """Load user profiles dynamically from the profiles folder."""
        profiles = {}
        
        if not os.path.exists(self.profiles_dir):
            print(f"⚠️  Profiles directory '{self.profiles_dir}' not found. Creating it...")
            os.makedirs(self.profiles_dir, exist_ok=True)
            return profiles
        
        try:
            for filename in os.listdir(self.profiles_dir):
                if filename.endswith('.json'):
                    filepath = os.path.join(self.profiles_dir, filename)
                    try:
                        profile = UserProfile.from_json_file(filepath)
                        profile_key = filename[:-5]  # Remove .json extension
                        profiles[profile_key] = profile
                        print(f"✅ Loaded profile: {profile.name}")
                    except Exception as e:
                        print(f"❌ Error loading profile from {filename}: {str(e)}")
        except Exception as e:
            print(f"❌ Error reading profiles directory: {str(e)}")
        
        return profiles
    
    def _ensure_reports_directory(self) -> None:
        """Ensure the reports directory exists."""
        if not os.path.exists(self.reports_dir):
            os.makedirs(self.reports_dir, exist_ok=True)
            print(f"📁 Created reports directory: {self.reports_dir}")
    
    def get_available_profiles(self) -> Dict[str, UserProfile]:
        """Get all available user profiles."""
        return self.user_profiles
    
    def reload_profiles(self) -> None:
        """Reload profiles from folder."""
        self.user_profiles = self._load_profiles_from_folder()
    
    def create_profile(self, profile_name: str, profile_data: Dict[str, Any]) -> bool:
        """Create a new profile."""
        try:
            filename = f"{profile_name.lower().replace(' ', '_')}.json"
            filepath = os.path.join(self.profiles_dir, filename)
            
            if os.path.exists(filepath):
                print(f"❌ Profile '{profile_name}' already exists.")
                return False
            
            # Create UserProfile instance to validate data
            profile = UserProfile(
                name=profile_data['name'],
                description=profile_data['description'],
                analysis_steps=profile_data['analysis_steps'],
                report_template=profile_data['report_template'],
                template_mapping=profile_data.get('template_mapping', {}),
                summary_text=profile_data.get('summary_text', '')
            )
            
            # Save to file
            profile.save_to_file(filepath)
            
            # Reload profiles
            self.reload_profiles()
            
            print(f"✅ Profile '{profile_name}' created successfully.")
            return True
            
        except Exception as e:
            print(f"❌ Error creating profile: {str(e)}")
            return False
    
    def update_profile(self, profile_key: str, profile_data: Dict[str, Any]) -> bool:
        """Update an existing profile."""
        try:
            filename = f"{profile_key}.json"
            filepath = os.path.join(self.profiles_dir, filename)
            
            if not os.path.exists(filepath):
                print(f"❌ Profile '{profile_key}' not found.")
                return False
            
            # Create UserProfile instance to validate data
            profile = UserProfile(
                name=profile_data['name'],
                description=profile_data['description'],
                analysis_steps=profile_data['analysis_steps'],
                report_template=profile_data['report_template'],
                template_mapping=profile_data.get('template_mapping', {}),
                summary_text=profile_data.get('summary_text', '')
            )
            
            # Save to file
            profile.save_to_file(filepath)
            
            # Reload profiles
            self.reload_profiles()
            
            print(f"✅ Profile '{profile_key}' updated successfully.")
            return True
            
        except Exception as e:
            print(f"❌ Error updating profile: {str(e)}")
            return False
    
    def delete_profile(self, profile_key: str) -> bool:
        """Delete a profile."""
        try:
            filename = f"{profile_key}.json"
            filepath = os.path.join(self.profiles_dir, filename)
            
            if not os.path.exists(filepath):
                print(f"❌ Profile '{profile_key}' not found.")
                return False
            
            os.remove(filepath)
            
            # Reload profiles
            self.reload_profiles()
            
            print(f"✅ Profile '{profile_key}' deleted successfully.")
            return True
            
        except Exception as e:
            print(f"❌ Error deleting profile: {str(e)}")
            return False
    
    def list_profiles(self) -> None:
        """List all available profiles."""
        profiles = self.get_available_profiles()
        
        if not profiles:
            print("📝 No profiles found.")
            return
        
        print("📋 Available Profiles:")
        print("=" * 40)
        for key, profile in profiles.items():
            print(f"🔹 {profile.name} ({key})")
            print(f"   📝 {profile.description}")
            print(f"   📊 {len(profile.analysis_steps)} analysis steps")
            print()
    
    def manage_profiles(self) -> None:
        """Interactive profile management menu."""
        while True:
            print("\n🛠️  Profile Management")
            print("=" * 30)
            print("1. List all profiles")
            print("2. Create new profile")
            print("3. Edit existing profile")
            print("4. Delete profile")
            print("5. Back to main menu")
            print()
            
            choice = input("Enter your choice (1-5): ").strip()
            
            if choice == "1":
                self.list_profiles()
            elif choice == "2":
                self._create_profile_interactive()
            elif choice == "3":
                self._edit_profile_interactive()
            elif choice == "4":
                self._delete_profile_interactive()
            elif choice == "5":
                break
            else:
                print("❌ Invalid choice. Please try again.")
    
    def _create_profile_interactive(self) -> None:
        """Interactive profile creation."""
        print("\n📝 Create New Profile")
        print("=" * 25)
        
        name = input("Profile name: ").strip()
        if not name:
            print("❌ Profile name cannot be empty.")
            return
        
        description = input("Profile description: ").strip()
        if not description:
            print("❌ Profile description cannot be empty.")
            return
        
        print("\nEnter analysis steps (press Enter twice to finish):")
        analysis_steps = []
        while True:
            step = input(f"Step {len(analysis_steps) + 1}: ").strip()
            if not step:
                if analysis_steps:
                    break
                else:
                    print("❌ At least one analysis step is required.")
                    continue
            analysis_steps.append(step)
        
        print("\nEnter report template (use {variable_name} for placeholders):")
        print("Available variables: {image_url}, {timestamp}, {profile_name}, {summary}")
        template_lines = []
        print("Enter template (press Enter twice to finish):")
        while True:
            line = input()
            if not line and template_lines:
                break
            template_lines.append(line)
        
        report_template = "\n".join(template_lines)
        if not report_template.strip():
            report_template = "# {profile_name} Analysis Report\n\n## 📊 Results\n{summary}"
        
        # Create template mapping
        template_mapping = {}
        for i in range(len(analysis_steps)):
            var_name = input(f"Template variable for step {i+1} '{analysis_steps[i][:30]}...': ").strip()
            if var_name:
                template_mapping[f"analysis_{i+1}"] = var_name
        
        summary_text = input("Summary text (optional): ").strip()
        
        profile_data = {
            'name': name,
            'description': description,
            'analysis_steps': analysis_steps,
            'report_template': report_template,
            'template_mapping': template_mapping,
            'summary_text': summary_text
        }
        
        self.create_profile(name, profile_data)
    
    def _edit_profile_interactive(self) -> None:
        """Interactive profile editing."""
        profiles = self.get_available_profiles()
        if not profiles:
            print("❌ No profiles available to edit.")
            return
        
        print("\n✏️  Edit Profile")
        print("=" * 20)
        self.list_profiles()
        
        profile_key = input("Enter profile key to edit: ").strip()
        if profile_key not in profiles:
            print("❌ Profile not found.")
            return
        
        profile = profiles[profile_key]
        print(f"\nEditing profile: {profile.name}")
        print("(Press Enter to keep current value)")
        
        # Edit basic info
        new_name = input(f"Name [{profile.name}]: ").strip() or profile.name
        new_description = input(f"Description [{profile.description}]: ").strip() or profile.description
        
        # Edit analysis steps
        print("\nCurrent analysis steps:")
        for i, step in enumerate(profile.analysis_steps, 1):
            print(f"  {i}. {step}")
        
        edit_steps = input("\nEdit analysis steps? (y/n): ").strip().lower() == 'y'
        new_analysis_steps = profile.analysis_steps
        
        if edit_steps:
            print("Enter new analysis steps (press Enter twice to finish):")
            new_analysis_steps = []
            while True:
                step = input(f"Step {len(new_analysis_steps) + 1}: ").strip()
                if not step:
                    if new_analysis_steps:
                        break
                    else:
                        print("❌ At least one analysis step is required.")
                        continue
                new_analysis_steps.append(step)
        
        profile_data = {
            'name': new_name,
            'description': new_description,
            'analysis_steps': new_analysis_steps,
            'report_template': profile.report_template,
            'template_mapping': profile.template_mapping,
            'summary_text': profile.summary_text
        }
        
        self.update_profile(profile_key, profile_data)
    
    def _delete_profile_interactive(self) -> None:
        """Interactive profile deletion."""
        profiles = self.get_available_profiles()
        if not profiles:
            print("❌ No profiles available to delete.")
            return
        
        print("\n🗑️  Delete Profile")
        print("=" * 20)
        self.list_profiles()
        
        profile_key = input("Enter profile key to delete: ").strip()
        if profile_key not in profiles:
            print("❌ Profile not found.")
            return
        
        profile = profiles[profile_key]
        confirm = input(f"Are you sure you want to delete '{profile.name}'? (y/n): ").strip().lower()
        
        if confirm == 'y':
            self.delete_profile(profile_key)
        else:
            print("❌ Deletion cancelled.")
    
    def select_user_profile(self) -> Optional[UserProfile]:
        """Interactive user profile selection."""
        print("👤 User Profile Selection")
        print("=" * 40)
        print()
        
        profiles = self.get_available_profiles()
        
        print("Available profiles:")
        for i, (key, profile) in enumerate(profiles.items(), 1):
            print(f"{i}. {profile.name}")
            print(f"   {profile.description}")
            print()
        
        while True:
            try:
                choice = input(f"Enter profile number (1-{len(profiles)}): ").strip()
                choice_num = int(choice)
                
                if 1 <= choice_num <= len(profiles):
                    profile_key = list(profiles.keys())[choice_num - 1]
                    selected_profile = profiles[profile_key]
                    
                    print(f"\n✅ Selected: {selected_profile.name}")
                    print(f"📝 Description: {selected_profile.description}")
                    print("\n📋 Analysis steps:")
                    for i, step in enumerate(selected_profile.analysis_steps, 1):
                        print(f"   {i}. {step}")
                    print()
                    
                    return selected_profile
                else:
                    print("❌ Invalid choice. Please enter a number between 1 and 4.")
            except ValueError:
                print("❌ Please enter a valid number.")
    
    def get_user_input(self, profile: UserProfile) -> tuple:
        """Get image URL and custom text from user."""
        print("📝 Input Information")
        print("=" * 30)
        print()
        
        # Get image URL
        image_url = input("🔗 Enter image URL or path: ").strip()
        if not image_url:
            print("❌ Please enter an image URL or path.")
            return None, None
        
        # Get custom text
        print(f"\n💡 Profile: {profile.name}")
        print("📋 Available analysis steps:")
        for i, step in enumerate(profile.analysis_steps, 1):
            print(f"   {i}. {step}")
        print()
        
        custom_text = input("📝 Enter your custom analysis request (or press Enter to use profile defaults): ").strip()
        
        return image_url, custom_text
    
    def analyze_with_profile(
        self,
        image_url: str,
        profile: UserProfile,
        custom_text: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze image using a specific user profile.
        
        Args:
            image_url: URL or path to the image
            profile: Selected user profile
            custom_text: Optional custom analysis text
            
        Returns:
            Dictionary containing structured analysis results
        """
        try:
            # Use custom text if provided, otherwise use profile steps
            if custom_text:
                analysis_questions = [custom_text]
            else:
                analysis_questions = profile.analysis_steps
            
            # Perform all analyses
            analysis_results = {}
            for i, question in enumerate(analysis_questions):
                print(f"🔄 Analysis {i+1}/{len(analysis_questions)}: {question[:50]}...")
                result = self.agent.analyze_image(image_url, question=question)
                analysis_results[f"analysis_{i+1}"] = {
                    "question": question,
                    "result": result
                }
            
            # Create structured result
            structured_result = {
                "user_profile": profile.name,
                "image_url": image_url,
                "custom_text": custom_text,
                "analysis_results": analysis_results,
                "analysis_type": "profile_based_analysis",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "agent_type": "ImageAnalysisChatAgent",
                    "model_used": "GPT-4O Mini",
                    "analysis_method": "profile_based_analysis",
                    "input_type": "image_url_or_path",
                    "status": "completed",
                    "profile_description": profile.description
                }
            }
            
            return structured_result
            
        except Exception as e:
            error_result = {
                "user_profile": profile.name,
                "image_url": image_url,
                "custom_text": custom_text,
                "analysis_results": {},
                "analysis_type": "profile_based_analysis",
                "timestamp": datetime.now().isoformat(),
                "status": "failed",
                "error": str(e)
            }
            return error_result
    
    def generate_markdown_report(
        self,
        structured_result: Dict[str, Any],
        profile: UserProfile
    ) -> str:
        """
        Generate markdown report from structured results.
        
        Args:
            structured_result: Analysis results
            profile: User profile used for analysis
            
        Returns:
            Formatted markdown report
        """
        if structured_result.get("status") == "failed":
            return f"# Analysis Failed\n\nError: {structured_result.get('error', 'Unknown error')}"
        
        # Extract analysis results
        analysis_results = structured_result.get("analysis_results", {})
        
        # Create template variables
        template_vars = {
            "image_url": structured_result.get("image_url", ""),
            "timestamp": structured_result.get("timestamp", ""),
            "profile_name": profile.name
        }
        
        # Map analysis results to template variables using profile mapping
        if profile.template_mapping:
            for analysis_key, template_var in profile.template_mapping.items():
                result_value = analysis_results.get(analysis_key, {}).get("result", "N/A")
                template_vars[template_var] = result_value
        
        # Add summary
        template_vars["summary"] = profile.summary_text or "Analysis completed successfully."
        
        # Format the template
        markdown_report = profile.report_template.format(**template_vars)
        
        return markdown_report
    
    def save_markdown_report(self, markdown_content: str, filename: Optional[str] = None) -> str:
        """
        Save markdown report to file.
        
        Args:
            markdown_content: Markdown content to save
            filename: Optional filename
            
        Returns:
            Filename where report was saved
        """
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"image_analysis_report_{timestamp}.md"
        
        # Ensure the filename includes the reports directory path
        if not filename.startswith(self.reports_dir):
            filepath = os.path.join(self.reports_dir, filename)
        else:
            filepath = filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        return filepath
    
    def summarize_markdown(self, markdown_content: str, max_words: int = 300) -> str:
        """
        Summarize markdown content to keep it under the specified word limit.
        
        Args:
            markdown_content: The markdown content to summarize
            max_words: Maximum number of words allowed
            
        Returns:
            Summarized markdown content
        """
        # Remove markdown formatting to get plain text
        import re
        
        # Remove markdown headers, bold, italic, etc.
        plain_text = re.sub(r'#+\s*', '', markdown_content)  # Remove headers
        plain_text = re.sub(r'\*\*(.*?)\*\*', r'\1', plain_text)  # Remove bold
        plain_text = re.sub(r'\*(.*?)\*', r'\1', plain_text)  # Remove italic
        plain_text = re.sub(r'`(.*?)`', r'\1', plain_text)  # Remove code
        plain_text = re.sub(r'---', '', plain_text)  # Remove horizontal rules
        plain_text = re.sub(r'\n\s*\n', '\n', plain_text)  # Remove extra newlines
        
        # Split into sentences and words
        sentences = re.split(r'[.!?]+', plain_text)
        words = []
        for sentence in sentences:
            sentence_words = sentence.strip().split()
            words.extend(sentence_words)
        
        # If already under word limit, return original
        if len(words) <= max_words:
            return markdown_content
        
        # Create summary by keeping key sections and truncating others
        summary_sections = []
        
        # Extract main sections from markdown
        sections = re.split(r'##\s+', markdown_content)
        
        if len(sections) > 1:
            # Keep the title and first section
            title_section = sections[0]
            summary_sections.append(title_section)
            
            # Process remaining sections
            for section in sections[1:]:
                if section.strip():
                    # Extract section title and content
                    lines = section.split('\n')
                    if lines:
                        section_title = lines[0].strip()
                        section_content = '\n'.join(lines[1:]).strip()
                        
                        # Truncate section content if too long
                        section_words = section_content.split()
                        if len(section_words) > 50:  # Limit each section to 50 words
                            section_content = ' '.join(section_words[:50]) + '...'
                        
                        summary_sections.append(f"## {section_title}\n{section_content}")
        else:
            # If no clear sections, truncate the entire content
            words = markdown_content.split()
            if len(words) > max_words:
                summary_content = ' '.join(words[:max_words]) + '...'
                return summary_content
            else:
                return markdown_content
        
        # Combine sections
        summarized_markdown = '\n\n'.join(summary_sections)
        
        # Final word count check
        final_words = summarized_markdown.split()
        if len(final_words) > max_words:
            # Truncate further if needed
            summarized_markdown = ' '.join(final_words[:max_words]) + '...'
        
        return summarized_markdown
    
    def save_summarized_markdown(self, markdown_content: str, filename: Optional[str] = None) -> str:
        """
        Save summarized markdown to file.
        
        Args:
            markdown_content: Markdown content to save
            filename: Optional filename
            
        Returns:
            Filename where summarized markdown was saved
        """
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"summarized_analysis_report_{timestamp}.md"
        
        # Ensure the filename includes the reports directory path
        if not filename.startswith(self.reports_dir):
            filepath = os.path.join(self.reports_dir, filename)
        else:
            filepath = filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        return filepath
    
    def analyze_with_message(
        self, 
        image_url: str, 
        message: str,
        save_result: bool = False,
        filename: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze an image with a custom message and return structured results.
        
        Args:
            image_url: URL or path to the image
            message: Custom analysis message/question
            save_result: Whether to save results to JSON file
            filename: Optional filename for saving results
            
        Returns:
            Dictionary containing structured analysis results
        """
        try:
            # Perform the analysis
            analysis_result = self.agent.analyze_image(image_url, question=message)
            
            # Create structured result
            structured_result = {
                "user_message": message,
                "image_url": image_url,
                "analysis_result": analysis_result,
                "analysis_type": "structured_image_analysis",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "agent_type": "ImageAnalysisChatAgent",
                    "model_used": "GPT-4O Mini",
                    "analysis_method": "question_based_analysis",
                    "input_type": "image_url_or_path",
                    "status": "completed"
                }
            }
            
            # Save to file if requested
            if save_result:
                if not filename:
                    filename = f"analysis_result_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                
                # Ensure the filename includes the reports directory path
                if not filename.startswith(self.reports_dir):
                    filepath = os.path.join(self.reports_dir, filename)
                else:
                    filepath = filename
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(structured_result, f, indent=2, ensure_ascii=False)
                print(f"✅ Results saved to {filepath}")
            
            return structured_result
            
        except Exception as e:
            error_result = {
                "user_message": message,
                "image_url": image_url,
                "analysis_result": f"Error: {str(e)}",
                "analysis_type": "structured_image_analysis",
                "timestamp": datetime.now().isoformat(),
                "status": "failed",
                "error": str(e)
            }
            return error_result
    
    def batch_analyze(
        self, 
        image_analysis_pairs: list,
        save_results: bool = False
    ) -> list:
        """
        Perform batch analysis on multiple image-message pairs.
        
        Args:
            image_analysis_pairs: List of tuples (image_url, message)
            save_results: Whether to save results to JSON file
            
        Returns:
            List of structured analysis results
        """
        results = []
        
        for i, (image_url, message) in enumerate(image_analysis_pairs):
            print(f"🔄 Analyzing image {i+1}/{len(image_analysis_pairs)}...")
            result = self.analyze_with_message(image_url, message)
            results.append(result)
        
        if save_results:
            filename = f"batch_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            filepath = os.path.join(self.reports_dir, filename)
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            print(f"✅ Batch results saved to {filepath}")
        
        return results


def run_image_analysis(analyzer: StructuredImageAnalyzer) -> None:
    """Run the image analysis workflow."""
    # Step 1: User profile selection
    selected_profile = analyzer.select_user_profile()
    if not selected_profile:
        print("❌ No profile selected. Returning to main menu.")
        return
    
    # Step 2: Get user input
    image_url, custom_text = analyzer.get_user_input(selected_profile)
    if not image_url:
        print("❌ No image URL provided. Returning to main menu.")
        return
    
    # Step 3: Perform analysis
    print(f"\n🔄 Performing analysis with {selected_profile.name} profile...")
    structured_result = analyzer.analyze_with_profile(
        image_url=image_url,
        profile=selected_profile,
        custom_text=custom_text
    )
    
    # Step 4: Generate markdown report
    print("📝 Generating markdown report...")
    markdown_report = analyzer.generate_markdown_report(structured_result, selected_profile)
    
    # Step 5: Summarize the markdown report
    print("📊 Summarizing report (keeping under 300 words)...")
    summarized_report = analyzer.summarize_markdown(markdown_report, max_words=300)
    
    # Step 6: Display and save results
    print("\n📊 Analysis Results")
    print("=" * 40)
    print(f"👤 Profile: {selected_profile.name}")
    print(f"🔗 Image: {image_url}")
    print(f"📝 Custom Text: {custom_text or 'Using profile defaults'}")
    print(f"⏰ Timestamp: {structured_result['timestamp']}")
    
    # Save original markdown report
    original_filename = analyzer.save_markdown_report(markdown_report)
    print(f"📄 Original report saved to: {original_filename}")
    
    # Save summarized markdown report
    summarized_filename = analyzer.save_summarized_markdown(summarized_report)
    print(f"📄 Summarized report saved to: {summarized_filename}")
    
    # Display word count information
    original_words = len(markdown_report.split())
    summarized_words = len(summarized_report.split())
    print(f"📊 Word count: {original_words} → {summarized_words} words")
    
    # Display preview of summarized report
    print("\n📋 Summarized Report Preview:")
    print("-" * 40)
    lines = summarized_report.split('\n')[:15]  # Show first 15 lines
    for line in lines:
        print(line)
    if len(summarized_report.split('\n')) > 15:
        print("...")
    
    print("\n✅ Analysis completed successfully!")
    print(f"💡 Check the full report in: {original_filename}")
    print(f"💡 Check the summarized report in: {summarized_filename}")
    print("💡 The summarized report is kept under 300 words for easy reading.")


def main():
    """Main function with menu-driven interface for multimodal prompt enrichment and profile management."""
    
    print("🧠 Vibe Mind - Multimodal Prompt Enrichment Tool")
    print("=" * 55)
    print()
    
    # Initialize the analyzer
    analyzer = StructuredImageAnalyzer()
    
    while True:
        print("\n🏠 Main Menu")
        print("=" * 15)
        print("1. 🔍 Run Image Analysis")
        print("2. 🛠️  Manage Profiles")
        print("3. 📋 List Available Profiles")
        print("4. 🔄 Reload Profiles")
        print("5. 🚪 Exit")
        print()
        
        choice = input("Enter your choice (1-5): ").strip()
        
        if choice == "1":
            profiles = analyzer.get_available_profiles()
            if not profiles:
                print("❌ No profiles available. Please create a profile first.")
                continue
            run_image_analysis(analyzer)
        elif choice == "2":
            analyzer.manage_profiles()
        elif choice == "3":
            analyzer.list_profiles()
        elif choice == "4":
            print("🔄 Reloading profiles...")
            analyzer.reload_profiles()
            print("✅ Profiles reloaded successfully.")
        elif choice == "5":
            print("👋 Goodbye! Thank you for using Vibe Mind.")
            break
        else:
            print("❌ Invalid choice. Please try again.")


if __name__ == "__main__":
    main() 